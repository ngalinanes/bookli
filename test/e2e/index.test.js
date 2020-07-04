const fixture = require('../../scripts/fixture.js');
const startServer = require('../../server/src/index.js');
const BookModels = require('../../server/src/models/book.js');

let BASE_URL;
let server;

before(async (browser, done) => {
    server = await startServer();

    BASE_URL = `http://localhost:${server.address().port}`;
    done();
});

beforeEach(async (browser, done) => {
    await BookModels.Book.sync({ force: true });
    await fixture.initBooks();
    done();
});

after(() => {
    server.close();
});

describe('Home Test', () => {
    test('Deberia tener de titulo Bookli', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .assert.titleContains('Bookli');
    });

    test('Deberia mostrar el logo de Bookli', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.brand__logo')
            .assert.attributeContains(
                '.brand__logo',
                'src',
                '/assets/logo.svg'
            );
    });

    test('Click en el logo debe redirigir al home', browser => {
        
        browser
        .url(BASE_URL)
        .waitForElementVisible('body')
        .waitForElementVisible('.brand')
        .assert.attributeEquals(
            '.brand',
            'href',
            'http://localhost:3000/'
        );

        browser
        .url(BASE_URL + '/detail/1')
        .waitForElementVisible('body')
        .waitForElementVisible('.brand')
        .click('.brand'
        );

        browser
        .assert.urlEquals('http://localhost:3000/');
    });

    test('Deberia mostrar el placeholder en el boton de busqueda', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('body > header > div.search > input')
            .assert.attributeContains(
                'body > header > div.search > input',
                'placeholder',
                'Buscar un libro'
            );
    });

    test('Deberia mostrar la lista de libros', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .assert.elementPresent('.booklist .book');
    });

    test('Deberia poder encontrar un libro por titulo', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('Operaci')
            .pause(400)
            .expect.elements('.booklist .book')
            .count.to.equal(1);
    });

    test('Deberia mostrar un mensaje cuando no se encuentra un libro', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('No existe')
            .pause(400);

        browser.expect.elements('.booklist .book').count.to.equal(0);
        browser.expect
            .element('.booklist.booklist--empty p')
            .text.to.equal(
                'Hmmm... Parece que no tenemos el libro que buscas.\nProba con otra busqueda.'
            );
    });
	
	test('Test Opacidad libro al hacer Hover', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist')
            .moveToElement(
                'body > main > div > div.books-container > div > a:nth-child(1) > div',
                10,
                10,
            )
            .assert.cssProperty(
                'body > main > div > div.books-container > div > a:nth-child(1) > div',
                'opacity',
                '0.5'
            )
	});
});

describe('Detail view', () => {

	test('Deberia aparecer los botones Dejar de leer y Lo termine! al hacer click en Volver a leer de un libro terminado', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(1000)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]')
            .waitForElementVisible('.book__actions [data-ref=addToFinish]')
            .click('.book__actions [data-ref=addToFinish]')
            .pause(1000)
            .click('.book__actions [data-ref=removeFromFinish]')
            .pause(1000)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]')
            .waitForElementVisible('.book__actions [data-ref=addToFinish]');

        browser.expect
            .element('.book__actions [data-ref=removeFromList]')
            .text.to.equal('Dejar de leer');

        browser.expect
            .element('.book__actions [data-ref=addToFinish]')
            .text.to.equal('Lo termine!');
            
    });





    test('Deberia mostrar boton para agregar a lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser.expect
            .element('.book__actions [data-ref=addToList]')
            .text.to.equal('Empezar a leer');
    });

    test('Chequear que el boton Volver redirija al home', browser => {
        //Chequeo que el elemento "a" tenga el atributo href con la url del home, ya que los demas botones dentro de .book__actions son "button" y el unico "a" es Volver
        browser
        .url(BASE_URL + '/detail/1')
        .waitForElementVisible('body')
        .waitForElementVisible('.book__actions')
        .waitForElementVisible('a')
        .assert.attributeEquals(
            'a',
            'href',
            'http://localhost:3000/'
        );

        browser
        .expect.element('body > main > div > div.book__actions > a')
        .text.to.equal('Volver');

        browser
        .url(BASE_URL + '/detail/1')
        .waitForElementVisible('body')
        .waitForElementVisible('.book__actions')
        .waitForElementVisible('a')
        .click('a');

        browser
        .assert.urlEquals('http://localhost:3000/');
    });

    test('Deberia mostrar boton para remover libro de la lista de lectura si el libro es parte de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(1000)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=removeFromList]')
            .text.to.equal('Dejar de leer');
    });

    test('Deberia poder verse el pais de un libro en el detalle', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__body');
    
        browser.expect
            .element('body > main > div > div.book__body > div > p:nth-child(2) > span')
            .text.to.equal('algunPais');
    });

    test('Deberia poder remover libro de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=removeFromList]')
            .text.to.equal('Dejar de leer');

        browser
            .click('.book__actions [data-ref=removeFromList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser.expect
            .element('.book__actions [data-ref=addToList]')
            .text.to.equal('Empezar a leer');
    });

    test('Deberia poder finalizar un libro de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=addToFinish]')
            .text.to.equal('Lo termine!');

        browser
            .click('.book__actions [data-ref=addToFinish]')
            .pause(400)
            .waitForElementVisible(
                '.book__actions [data-ref=removeFromFinish]'
            );

        browser.expect
            .element('.book__actions [data-ref=removeFromFinish]')
            .text.to.equal('Volver a leer');
    });
	
	
});

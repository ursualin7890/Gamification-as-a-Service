const { parse } = require('querystring');

const ContactMessageModel = require('../models/ContactMessage');
const indexRoute = require('../routes/index');
const errorRoute = require('../routes/error');
const contactMessageRepository = require('../repositories/contactMessagesRepository');
const contactMessageServices = require('../services/contactMessageServices');

/**
 * Rezolva un request de tip POST facut in pagina /.
 * @param {*} request Request-ul facut.
 * @param {*} response Raspunsul dat de server.
 */
function handleContactRequest(request, response) {
    // Citesc request body-ul
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });

    var parsedBody;
    request.on('end', async () => {
        // Parsez request body-ul
        parsedBody = parse(body);

        // Creez modelul
        let message = new ContactMessageModel(null, parsedBody.contact_name, parsedBody.contact_email, parsedBody.contact_message);

        // Verific daca a fost o redirectionare catre pagina principala ("/")
        if(message.name == null && message.email == null && message.text == null) {
            return indexRoute(request, response);
        }

        // Verific datele
        var serviceResponse = contactMessageServices.verifyPresenceOfContactMessageCredentials(message, request, response);
        if(serviceResponse == 0) {
            return;
        }

        // Validez datele
        var serviceResponse = contactMessageServices.validateContactMessageCredentials(message, request, response);
        if(serviceResponse == 0) {
            return;
        }

        // Adaug modelul in baza de date
        var dbAnswer = null;
        await contactMessageRepository.addContactMessageToDatabase(message).then(function (result) {
            dbAnswer = result;
        });

        if(dbAnswer == -1) { // Database error
            // Creez un raspuns, instiintand utilizatorul de eroare
            response.statusCode = 500;
            request.statusCodeMessage = "Internal Server Error";
            request.errorMessage = "A apărut o eroare pe parcursul procesării cererii tale! Încearcă din nou mai târziu, iar dacă problema " + 
            "persistă, te rog să ne contactezi folosind formularul de pe pagina principală.";
            errorRoute(request, response);
            return;
        }

        request.successMessage = "Mesajul a fost trimis cu succes!";
        return indexRoute(request, response);
    });    
}

module.exports = {handleContactRequest};
var express = require('express');
var router = express.Router();

var mongoDb = require('../database/mongo');
/**
 * Type: POST
 * Name: gym/newGym
 * Description: Inserts a new Gym in the database and returns its keys.
 * Request:
 *     -Headers: Credentials
 *       -user: string 
 *       -pwd: string
 *      Body:
 *          -user: string
 *          -pwd: string
 *          -nameGym: string
 * Responses:
 *      200:
 *          -JSON object containing access keys:
 *              -userKey: string
 *              -coachKey: string
 *      400:
 *          -A feedback object
 *      500:
 *          -A feedback object
 */
router.post('/newGym', function(req, res) {
    var user = req.headers.user;
    var pwd = req.headers.pwd;
    if(!req.body.nameGym || !req.headers.user || !req.headers.pwd){
        res.status(404).send({
            'success': false,
            'message': 'Parámetros incompletos.'
        });
    }
    else{
        mongoDb.insertNewGym(user, pwd, req.body.nameGym, function(err, userKey, coachKey){
            if(err === null){
                res.status(200).send({
                    "userKey": userKey,
                    "coachKey": coachKey
                })
            }
            else{
                res.status(404).send({
                    'success': false,
                    'message': err
                });
            }
        });
    }
});

/**
 * Type: GET
 * Name: gym/login
 * Description: Returns success if they key given is correct for the given gym.
 * Request:
 *     -Headers: Credentials
 *       -user: string
 *       -pwd: string
 *       -namegym: string
 *       -key: string
 * Responses:
 *      200:
 *          -A feedback object:
 *              -success: boolean
 *              -message: string
 *              -type: admin | user
 *      400:
 *          -A feedback object
 *      500:
 *          -A feedback object
 */
router.get('/login', function(req, res) {
    if(!req.headers.user || !req.headers.pwd || !req.headers.namegym || !req.headers.key) {
        res.status(404).send({
            'success': false,
            'message': 'Cabecera de la petición vacía o incorrecta.'
        })
    } else{
        mongoDb.getUserKey(req.headers.user, req.headers.pwd, req.headers.namegym, function(err, result) {
            if(err) {
                res.status(404).send({
                    'success': false,
                    'message': err
                })
            } else{
                console.log(result + " " + req.headers.key);
                if(result === req.headers.key) {
                    res.status(200).send({
                        'success': true,
                        'message': 'Credenciales de usuario correctos, bienvenido.',
                        'type': 'user'
                    })
                } else{
                    mongoDb.getCoachKey(req.headers.user, req.headers.pwd, req.headers.namegym, function (err2, result2) {
                        if(err2) {
                            res.status(404).send({
                                'success': false,
                                'message': err
                            })
                        } else {
                            console.log(result2 + " " + req.headers.key);
                            if(req.headers.key === result2) {
                                res.status(200).send({
                                    'success': true,
                                    'message': 'Credenciales de administrador correctos, bienvenido.',
                                    'type': 'admin'
                                })
                            } else {
                                res.status(404).send({
                                    'success': false,
                                    'message': 'Credenciales incorrectos.'
                                })
                            }
                        }
                    })
                }
            }
        })
    }
});

module.exports = router;
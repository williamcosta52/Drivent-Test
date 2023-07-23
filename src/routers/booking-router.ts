import { Router } from 'express';
import * as booking from '../controllers/booking-controller';
import { authenticateToken } from '../middlewares';

const bookingRouter = Router();

bookingRouter.post('/', authenticateToken, booking.creatBooking);
bookingRouter.get('/', authenticateToken, booking.getBooking);

//Troca de reserva
//PUT: /booking/:bookingId
//A troca só pode ser efetuada para usuários que possuem reservas
//A troca pode ser efetuada apenas para quartos livres
//Receber roomId pelo body
//Sucesso: Deve retornar status code 200 com bookingId
//roomId não existente: Deve retornar status code 404
//roomId sem vaga: Deve retornar status code 403
//Fora da regra de negócio: Deve retornar status code 403

export default bookingRouter;

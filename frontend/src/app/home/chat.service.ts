import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ChatService {

	private socket = io('http://localhost:3000');
	constructor() { }
	
	sendMessage(data: any){
		
		this.socket.emit('client', data);
	}

	recieveMessage(){

		var message = new Observable<any>(
		observer =>{
			this.socket.on('server', (data)=>{
				observer.next(data);
			});

		});
	
		return message;
	}
}

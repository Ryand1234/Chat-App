import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

	private socket = io('http://localhost:3000');
	private old_url = '/api/room/chat/history';
	constructor(private http : HttpClient) { }


	retrieveOldMessage() {
		return this.http.get(this.old_url);
	}

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

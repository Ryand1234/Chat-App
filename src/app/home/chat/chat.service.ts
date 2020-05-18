import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs'
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

	private socket = io('http://localhost:3000');
	private old_url = '/api/room/chat/history';
	constructor(private http : HttpClient) { }

	httpOptions = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
	retrieveOldMessage() {
		return this.http.get(this.old_url, { headers: this.httpOptions, responseType: 'json'});
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

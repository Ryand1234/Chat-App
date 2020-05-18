import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class PcService {

	private socket = io('http://localhost:3000');
	private recover_url = '/api/chat/history/'
	constructor(private http : HttpClient) { }

	RecoverOldMessage(token: string){
		var new_recover_url = this.recover_url + token;
		return this.http.get(new_recover_url);
	}

	RecieveMessage(){
		var message =  new Observable<any>(
			observer=>{
				this.socket.on('personal server', (data)=>{
					observer.next(data);
			});
		});
		return message;
	}

	SendMessage(data: any){
			this.socket.emit('personal client', data);
		}
}

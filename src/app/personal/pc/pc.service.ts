import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class PcService {

	private socket = io('https://chating1-app.herokuapp.com');
	private recover_url = '/api/chat/history/'
	constructor(private http : HttpClient) { }

	httpOptions = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
	RecoverOldMessage(token: string){
		var new_recover_url = this.recover_url + token;
		this.socket.emit('pc');
		return this.http.post(new_recover_url), { headers: this.httpOptions, responseType: 'json'});
	}

	RecieveMessage(){
		var message =  new Observable<any>(
			observer=>{
				this.socket.on('PC server', (data)=>{
					observer.next(data);
			});
		});
		return message;
	}

	SendMessage(data: any){
			this.socket.emit('PC client', data);
		}
}

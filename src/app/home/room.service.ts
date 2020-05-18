import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class RoomService {

	private join_url = '/api/room/join/';
	private rooms_url = '/api/rooms';

	constructor(private http: HttpClient) { }

	httpOptions = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
	join(token: string){
		var new_url = this.join_url + token;
		return this.http.get(new_url, { headers: this.httpOptions, responseType: 'json'});
	}

	retrieveRooms(){
		console.log("URL: ",this.rooms_url);
		return this.http.get(this.rooms_url, { headers: this.httpOptions, responseType: 'json'});
	}
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class RoomService {

	private join_url = '/api/room/join/';
	private rooms_url = '/rooms';

	constructor(private http: HttpClient) { }

	private httpOptionsPlain = {
  headers: new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }),
  'responseType': 'json'
};
	join(token: string){
		var new_url = this.join_url + token;
		return this.http.get(new_url, this.httpOptionsPlain);
	}

	retrieveRooms(){
		return this.http.get(this.rooms_url, this.httpOptionsPlain);
	}
}

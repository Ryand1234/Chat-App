import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CreateService {

	private url = '/api/room/create';
	constructor(private http : HttpClient) { }

	createRoom(data: any) {
		console.log("ROOM: ",data);
		return this.http.post(this.url, data);
	}
}

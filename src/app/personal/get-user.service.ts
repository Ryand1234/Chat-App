import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GetUserService {

	private url = '/api/users';
	constructor(private http : HttpClient) { }

	getUser(){
		return this.http.post(this.url);
	}
}

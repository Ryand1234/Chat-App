import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GetUserService {

	private url = '/api/users';
	constructor(private http : HttpClient) { }

	httpOptions = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
	getUser(){
		return this.http.post(this.url, { headers: this.httpOptions, responseType: 'json'});
	}
}

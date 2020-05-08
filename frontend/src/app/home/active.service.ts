import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ActiveService {

	private url = '/api/user/active';
	constructor(public http : HttpClient) { }
	
	active(){
		return this.http.get(this.url);
	}
}

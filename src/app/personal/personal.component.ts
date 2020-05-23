import { Component, OnInit } from '@angular/core';
import { GetUserService } from './get-user.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent implements OnInit {

	constructor(private service : GetUserService) { }

	users: any;

	ngOnInit(): void {
		this.service.getUser().subscribe((result: any)=>{
			this.users = result;
		});
	}

}

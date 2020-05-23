import { Component, OnInit } from '@angular/core';
import { ActiveService } from './active.service';


@Component({
  selector: 'app-active-user',
  templateUrl: './active-user.component.html',
  styleUrls: ['./active-user.component.css']
})
export class ActiveUserComponent implements OnInit {

	constructor(public service : ActiveService) { }

	active_user: any;

	ngOnInit(): void {

		this.service.active().subscribe((result: any)=>{
			this.active_user = result;
		});
	}


}

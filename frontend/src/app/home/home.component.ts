import { Component, OnInit } from '@angular/core';
import { ActiveService } from './active.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	constructor(public activeService : ActiveService ) { }

	temp : any;
	msg : any;
	active_user : any = new Array();
	ngOnInit(): void {
		this.activeService.active().subscribe((result: any)=>
		{
			this.temp = result;
			if(this.temp.msg == undefined)
				this.active_user = result;
			else
				this.msg = result;
		});
	}

}

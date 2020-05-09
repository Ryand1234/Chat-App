import { Component, OnInit } from '@angular/core';
import { ActiveService } from './active.service';
import { ChatService } from './chat.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	temp : any;
	msg : any;
	message : string;
	message_array : any = new Array();
	active_user : any = new Array();

	constructor(public activeService : ActiveService,
                public chatService : ChatService) { 
	
		this.chatService.recieveMessage().subscribe((result)=>{
			this.message_array.push(result);
		});

	}
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

	onSubmit(){
		this.chatService.sendMessage({message : this.message});
		this.message = '';
	}

}

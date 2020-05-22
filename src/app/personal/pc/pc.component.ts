import { Component, OnInit } from '@angular/core';
import { PcService } from './pc.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pc',
  templateUrl: './pc.component.html',
  styleUrls: ['./pc.component.css']
})
export class PcComponent implements OnInit {

	message: string;
        chat: any = new Array();
        constructor(private service : PcService,
                private router : Router) {
                this.service.RecieveMessage().subscribe((result: any)=>{
                        this.chat.push(result);
                });
        }

	token: string;
	url : string;
	ngOnInit(): void {
		this.url = this.router.url
                this.token = this.url.split('/')[3];
                console.log("Token: ",this.token);
                this.service.RecoverOldMessage(this.token).subscribe((result: any)=>{
                        this.chat.push = result;
                });
        }

        onSubmit(){
                this.service.SendMessage({message: this.message, _id : this.token});
                this.message = '';
        }

}


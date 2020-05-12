import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { LogoutComponent } from './logout/logout.component';
import { ActiveUserComponent } from './active-user/active-user.component';
import { CreateRoomComponent } from './create-room/create-room.component';
import { ChatComponent } from './home/chat/chat.component';


const routes: Routes = [
{ path: '', redirectTo: '/room', pathMatch: 'full' },
{ path: 'login', component: LoginComponent },
{ path: 'chat', component: ChatComponent },
{ path: 'register', component: RegisterComponent },
{ path: 'room/create', component: CreateRoomComponent },
{ path: 'room', component: HomeComponent },
{ path: 'active', component: ActiveUserComponent },
{ path: 'logout', component: LogoutComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

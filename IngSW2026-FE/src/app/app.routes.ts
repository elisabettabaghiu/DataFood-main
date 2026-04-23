import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { WishlistComponent } from './component/wishlist/wishlist.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: '**', redirectTo: '' }
];


import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CountdownModule } from 'ngx-countdown';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { HelpComponent } from './components/help/help.component';
import { ColorPickerComponent } from './components/imports/color-picker/color-picker.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HelpComponent,
    ColorPickerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    CountdownModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

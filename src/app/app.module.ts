import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { HomeComponent } from './components/home/home.component';
import { MainNavigationMenuComponent } from './components/main-navigation-menu/main-navigation-menu.component';
import { CoreModule } from './core/core.module';
import { CloseSidebarDirective } from './directives/close-sidebar.directive';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { CanDeactivateGuard } from './shared/deactivate-guard/can-deactivate.guard';
import { UnsavedChangesGuard } from './shared/deactivate-guard/unsaved-changes.guard';
@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    HomeComponent,
    MainNavigationMenuComponent,
    CloseSidebarDirective,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    CoreModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressBarModule
  ],
  providers: [
    CanDeactivateGuard,UnsavedChangesGuard,
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

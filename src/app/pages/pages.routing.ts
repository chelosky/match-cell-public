import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";

/**
 * COMPONENTES
 */
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
    {
        path: '',
        component: PagesComponent,
        children: [
          {
            path: '',
            component: HomeComponent, data: { title: 'Home' }
            
          }
        ]
    },
];

@NgModule({
    declarations: [],
    imports: [
      RouterModule.forChild(routes)
    ],
    exports: [
      RouterModule
    ]
  })
export class PagesRoutingModule { }
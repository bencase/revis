import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'

import { AppComponent } from './app.component';
import { MainPanelComponent } from './main-panel/main-panel.component';

import { RedisCmdService } from './services/redis-cmd.service';
import { ConnectionsPanelComponent } from './connections-panel/connections-panel.component';
import { ConnPropsPanelComponent } from './conn-props-panel/conn-props-panel.component';
import { CenteredModalComponent } from './centered-modal/centered-modal.component';
import { TabbedViewComponent } from './tabbed-view/tabbed-view.component';
import { RedisContentComponent } from './redis-content/redis-content.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPanelComponent,
    ConnectionsPanelComponent,
    ConnPropsPanelComponent,
    CenteredModalComponent,
    TabbedViewComponent,
    RedisContentComponent
  ],
  imports: [
	BrowserModule,
	FormsModule,
	HttpClientModule
  ],
  providers: [RedisCmdService],
  bootstrap: [AppComponent]
})
export class AppModule { }

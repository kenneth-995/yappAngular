import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PatientService {
  public base_url = environment.BASE_URL;

  constructor(private htttClient: HttpClient) { }

  getAllPatients() {
    return this.htttClient.get(this.base_url+'/patient/');
  }

  getPatientsByClinic(id:number) {
    return this.htttClient.get(this.base_url+'/patient/clinic/'+id);
  }

}
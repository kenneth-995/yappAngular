import { Component, OnInit, OnDestroy, ViewChild, TemplateRef} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from '../../../services/user.service';
import { PatientService } from '../../../services/patient.service';
import { PatientDto } from '../../../models/dto/PatientDto';


@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  @ViewChild("modalDelete", {static: false}) modalDelete: TemplateRef<any>;
  @ViewChild("modalEdit", {static: false}) modalEdit: TemplateRef<any>;

  private destroy$ = new Subject();

  public patients: PatientDto[];

  public patientToUpdate: PatientDto = new PatientDto();

  public roleUser: number;



  constructor(
     private userService: UserService,
     private patientService: PatientService,
     private toast: ToastrService,
     private modalService: NgbModal ) { }

  ngOnInit(): void {
    this.patientToUpdate.name = 'asdasd'

    if(this.userService.getUserLogged != null) {
      
      this.getRoleUserAndPatients()

    } else {
      console.log('[errorPatientComponent] user==null!');
    }


  }

  private getRoleUserAndPatients() {

    console.log(this.userService.userLogged)
    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      (res: number) => {
        
        if (res === 1) {
          //superadmin
          this.patientService.getAllPatients().subscribe(
            (res: PatientDto[])=> {
              this.patients = res;
            }
          );
        } else if (res === 2 || res === 3) {
          //admin / user
          this.patientService.getPatientsByClinic(this.userService.userLogged.clinicId).subscribe(
            (res: PatientDto[])=> {
              this.patients = res;
            }
          );
        } else {
          console.log('[errorPatientComponent] get role user !=1 !=2 =!3');
        }

        this.roleUser = res as number;
      }, error=> {
        this.toast.error(JSON.stringify(error));
    });
  }

  public deletePatient (id:number) {
    this.modalService.open(this.modalDelete).result.then(
      r => {
        if (r === 'Si') {
          this.patientService.deletePatient(id).subscribe(
            (res: any) => {
              this.patients.forEach(
                (item, index) => {
                  if (item.id === id)
                  this.patients.splice(index, 1);
                })
            }, 
            (error) => {
              this.toast.error(error.error['message'], 'Error');
            }
          );//subscribe
        } else {
          console.log('no borrar')
        }
      }, error => {
        console.log(error);
     }
    );

  }

  public editPatient(patient: PatientDto, index:number) {


    let aux = JSON.stringify (this.patients[index])
    

    this.patientToUpdate = this.patients[index];

    this.modalService.open(this.modalEdit).result.then(
      r => {
        if (r === '0') {
          
          this.patientService.updatePatient(this.patientToUpdate).subscribe(
            (res: PatientDto) => {
              this.patients[index] = res;
            }, 
            (error) => {
              this.toast.error(error.error['message'], 'Error');
            }
          );
        } else {
          this.patients[index] = JSON.parse(aux);
          console.log('no editar')
        }
      }, error => {
        console.log(error);
     }
    );
  }

  public

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

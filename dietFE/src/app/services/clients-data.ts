// import { Injectable } from '@angular/core';
// import jsonData from '../../assets/Health_profiles.clients.json'

// @Injectable({
//   providedIn: 'root',
// })
// export class ClientsData {
  
//   pageSize: number=9;

//   getClients(page: number){
//     let pageStart = (page - 1) * this.pageSize; //let - partially global and local, var - for local variables.
//     let pageEnd = pageStart + this.pageSize;
//     return jsonData.slice(pageStart, pageEnd);
//   }

//   getLastPageNumber(){
//     return Math.ceil(jsonData.length / this.pageSize);
//   }
//   getClient(id: any){
//     let dataToReturn: any = [];
//     jsonData.forEach(function(client){
//       if (client._id.$oid == id){
//         dataToReturn.push(client);
//       }
//     })
//     return dataToReturn;
//   }


// }

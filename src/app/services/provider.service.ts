import { Injectable } from '@angular/core';

/* 1. Importe el módulo del HttpClient */
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  /* 2.Atributo URL */
  private URL: string =
    'https://hybrid-e5bea-default-rtdb.firebaseio.com/collection/mascotas.json';

  /* 3. Inyección de dependencia del HttpClient */
  constructor(private http: HttpClient) {}

  /* 4. Método con la petición HTTP */
  getResponse() {
    return this.http.get(this.URL);
  }

  /* 5. Método con la petición HTTP */
  postResponse(data: any) {
    return this.http.post(this.URL, data);
  }

  putResponse(position: number, updatedData: any) {
    return this.http.put(`${this.URL}/${position}`, updatedData);
  }
}

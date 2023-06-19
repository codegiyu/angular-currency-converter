import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private url = 'https://api.getgeoapi.com/v2/currency/'
  private apiKey = 'e73fbf02e9e7c73d12c3049fcb4f4457b0d06cbb'

  constructor(private http: HttpClient) { }

  getCurrencies() {
    return this.http.get<any[]>(`${this.url}list?api_key=${this.apiKey}`)
    // .pipe(
    //   tap((data: any) => {
    //     console.log(Object.entries(data.currencies))
    //     return Object.entries(data.currencies).filter((currency: any) => ["NGN", "GBP", "USD", "EUR", "JPY"].includes(currency[0]))
    // })
    // )
  }

  calcExchange(amount: string, from: string, to: string) {
    return this.http.get<any[]>(`${this.url}convert?api_key=${this.apiKey}&from=${from}&to=${to}&amount=${amount}`)
  }
}

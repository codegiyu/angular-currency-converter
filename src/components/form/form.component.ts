import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, Validators } from '@angular/forms';
import { ISelectOption } from 'ngx-semantic/modules/select';
import { NotificationService } from '../../services/notification.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})

// interface Rates {
//   currency_name: string;
//   rate: string;
//   rate_for_amount: string;
// }

export class FormComponent implements OnInit  {
  currencies: ISelectOption[] = []
  calculatedAmount: string = ""
  exchangeRate: string = ""
  isSubmitting: boolean = false

  constructor(
    private notify: NotificationService,
    private currencyService: CurrencyService
  ) {}

  converterForm = new FormGroup({
    amount: new FormControl("", [Validators.required, Validators.min(1)]),
    fromCurr: new FormControl("", [Validators.required]),
    toCurr: new FormControl("", [Validators.required])
  })

  get amount() {
    return this.converterForm.get("amount")
  }

  get fromCurr() {
    return this.converterForm.get("fromCurr")
  }

  get toCurr() {
    return this.converterForm.get("toCurr")
  }

  fetchCurrencies() {
    this.currencyService.getCurrencies().subscribe(
      (data: any) => {
        const optionsList: ISelectOption[] = Object.entries(data.currencies)
        .filter((currency: any) => ["NGN", "GBP", "USD", "EUR", "JPY"].includes(currency[0]))
        .map(item => {
          return {
            text: String(item[1]),
            value: item[0]
          }
        })
        this.currencies = optionsList;
      },
      (error: any) => {
        this.notify.showError(error.message);
        console.error(error)
      }
    )
  }

  ngOnInit(): void {
    this.fetchCurrencies();
    this.onChanges();
  }

  onChanges(): void {
    this.converterForm.valueChanges.subscribe(() => {
      console.log("yes")
      if (this.calculatedAmount !== "" && !this.isSubmitting) {
        this.resetExchange()
      }
    })
  }

  calculateAmount() {
    console.log(this.converterForm.value);

    if (this.converterForm.value.fromCurr === this.converterForm.value.toCurr) {
      this.notify.showError("Conversion cannot be carried out between the same currencies")
    } else {
      this.isSubmitting = true
      const amount = String(this.converterForm.value.amount)
      const from = String(this.converterForm.value.fromCurr)
      const to = String(this.converterForm.value.toCurr)
      this.currencyService.calcExchange(amount, from, to).subscribe(
        (data: any) => {
          console.log(data)
          if (data.rates) {
            const rates: any = Object.values(data.rates)[0]
            console.log(rates)
            this.calculatedAmount = `${amount} ${from} = ${Number(rates.rate_for_amount).toFixed(2).toLocaleString()} ${to}`
            this.exchangeRate = `1 ${from} = ${rates.rate} ${to}`

            this.converterForm.reset()
          }
          this.isSubmitting = false
        },
        (error: any) => {
          this.notify.showError(error.message);
          console.error(error)
          this.isSubmitting = false
        }
      )
    }
  }

  resetExchange() {
    console.log("no")
    this.calculatedAmount = ""
    this.exchangeRate = ""
  }
}

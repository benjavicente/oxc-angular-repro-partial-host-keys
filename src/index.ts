import { Directive } from '@angular/core'

@Directive({
  selector: 'a[myLink]',
  host: {
    '(click)': 'onClick()',
    '[attr.data-active]': 'active',
  },
})
export class MyLink {
  active = true
  onClick() {}
}

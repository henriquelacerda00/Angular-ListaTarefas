import {
  animate,
  group,
  keyframes,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Optional } from '@angular/core';

export const destaqueCardTrigger = trigger('destaqueCard', [
  state(
    'default',
    style({
      border: '2px solid #B2B6B4',
    })
  ),
  state(
    'destaque',
    style({
      border: '5px solid #B2B4B6',
      filter: 'brightness(90%)',
    })
  ),
  transition('default => destaque', [
    animate(
      '200ms ease-out',
      style({
        transform: 'scale(1.02)',
      })
    ),
    animate('200ms'),
  ]),
]);

export const showStateTrigger = trigger('showState', [
  transition(':enter', [
    style({
      opacity: 0,
    }),
    animate(
      300,
      style({
        opacity: 1,
      })
    ),
  ]),
  transition(':leave', [
    animate(
      300,
      style({
        opacity: 0,
      })
    ),
  ]),
]);

export const checkTrigger = trigger('checkOrNot', [
  transition('check => unCheck', [
    animate(
      '300ms ease-out',
      style({
        transform: 'scale(1.02)',
      })
    ),
    animate(
      '300ms ease-out',
      style({
        transform: 'scale(1.0)',
      })
    ),
  ]),
  transition('unCheck => check', [
    animate(
      '300ms ease-out',
      style({
        transform: 'scale(0.8)',
      })
    ),
    animate(
      '300ms ease-out',
      style({
        transform: 'scale(1.0)',
      })
    ),
  ]),
]);

export const filterTrigger = trigger('filterCards', [
  transition(':enter', [
    style({
      opacity: 0,
      width: 0,
    }),
    animate(
      '400ms ease-out',
      keyframes([
        style({
          offset: 0,
          opacity: 0,
          width: 0,
        }),
        style({
          offset: 0.8,
          opacity: 0.5,
          width: '*',
        }),
        style({
          offset: 1,
          opacity: 1,
          width: '*',
        }),
      ])
    ),
  ]),
  transition(':leave', [
    animate(
      '400ms ease-out',
      style({
        opacity: 0,
        width: 0,
      })
    ),
  ]),
]);

export const formButtonTrigger = trigger('formButton', [
  transition('invalid => valid', [
    query(
      '#bt-salvar',
      group([
        animate(
          '1000ms 500ms ease-out',
          style({ backgroundColor: '#63B77C' })
        ),
        animate(
          '300ms 300ms ease-out',
          style({ transform: 'scale(1.1)' })
        ),
        animate(
          '400ms 300ms ease-out',
          style({ transform: 'scale(1)' })
        ),
      ]),
      { optional: true }
    )
  ]),
  transition('valid => invalid', [
    query(
      '#bt-salvar',
      group([
        animate(
          '800ms ease-out',
          style({ backgroundColor: '#6c757d' })
        ),
        animate(
          '300ms ease-out',
          style({ transform: 'scale(1.1)' })
        ),
        animate(
          '400ms ease-out',
          style({ transform: 'scale(1)' })
        ),
      ]),
      { optional: true }
    )
  ])
]);

export const flyInOutTrigger = trigger('flyInOut', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateX(-100%)',
      width: '100%',
    }),
    group([
      animate(
        '0.3s 0.1s ease',
        style({
          transform: 'translateX(0)',
          width: '*',
        })
      ),
      animate(
        '0.3s ease',
        style({
          opacity: 1,
        })
      ),
    ]),
  ]),
  transition(':leave', [
    group([
      animate(
        '0.3s ease',
        style({
          transform: 'translateX(100%)',
          width: '*',
        })
      ),
      animate(
        '0.3s 0.2s ease',
        style({
          opacity: 0,
        })
      ),
    ]),
  ]),
]);

export const shakeTrigger = trigger('shakeAnimation', [
  transition('* => *', [
    query('input.ng-invalid:focus, select.ng-invalid:focus', [
      animate(
        '0.5s',
        keyframes([
          style({
            border: '4px solid red',
          }),
          style({
            transform: 'translateX(-10px)',
          }),
          style({
            transform: 'translateX(10px)',
          }),
          style({
            transform: 'translateX(-10px)',
          }),
          style({
            transform: 'translateX(10px)',
          }),
          style({
            transform: 'translateX(-10px)',
          }),
          style({
            transform: 'translateX(10px)',
          }),
          style({
            transform: 'translateX(0)',
          }),
        ])
      ),
    ],{optional:true}),
  ]),
]);


export const listStateTrigger = trigger('listState', [
  transition('* => *', [
    query(':enter', [
      style({
        opacity : 0,
        transform: 'translateX(-100%)'
      }),
      stagger(200 , [
        animate('500ms ease-out' , keyframes([
          style({
            opacity : 1,
            transform: 'translateX(15%)',
            offset: 0.4
          }),
          style({
            opacity : 1,
            transform: 'translateX(0)',
            offset: 1
          }),
        ]))
      ])
    ],{optional:true})
  ])
])

// @flow
import { cancelled, changed } from 'style/mixins';
import { red } from 'style/colors';
export default {
  main: {
    fontSize: '2.1em',
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '& a': {
      color: 'inherit',
    },
  },
  detail: {
    whiteSpace: 'inherit',
  },
  info: {
    color: red,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  additional: changed,
  hbf: {
    fontWeight: 'bold',
  },
  cancelled,
};

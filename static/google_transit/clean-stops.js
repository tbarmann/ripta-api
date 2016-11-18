const _ = require('lodash');

const abbrevOrCapitalize = (w) => {
  const replace = {
    'fs': 'far side of',
    'ns': 'near side of',
    'opp': 'opposite',
    'rt': 'Rout',
    '@': 'at',
    'at': 'at',
    'of': 'of',
    't.f.': 'T.F.',
    'ri/ma': 'RI/MA',
    'cvs': 'CVS',
    'ccri': 'CCRI',
    'uri': 'URI',
    'mfg': 'Manufacturing',
    'narr': 'Narragansett',
    'nuwc': 'NUWC',
    'ter': 'Terrace',
    'ri': 'RI',
    'between': 'between',
    '[on-ramp]': 'on-ramp',
    'svc': 'Service',
    'commerical': 'Commercial',
    'commercial': 'Commercial',
    'dfs': 'far side of',
    'hq': 'HQ'
  };
  return (replace.hasOwnProperty(w)) ? replace[w] : _.capitalize(w)
}

// stops = JSON.parse(File.read('stops.json'))


// # sub in abbreviated values
// # fix words that start with '(', '(stop' => '(Stop'
// # fix words with '&' in the middle, 'stop&shop' => 'Stop&Shop'
// # fix exits, '1a' => '1A'

// def process_word(w)
//   w = abrev_or_capitalize(w)
//   if /^\((?<x>.+)$/ =~ w
//     w = '(#{process_word(x)}'
//   elsif /^(?<x>.+)\&(?<y>.+)$/ =~ w
//     w = '#{process_word(x)}&#{process_word(y)}'
//   elsif /^(?<num>\d+)(?<c>\D)$/ =~ w
//     w = '#{num}#{c.capitalize}'
//   end
//   w
// end

// # shorten exact addresses 'S Angell at 120 S Angell' => '120 S Angell'
// def shorten_exact_address(w)
//   format = /^(?<street_1>.+) at (?<addr>\d+) (?<street_2>.+?)( St)?( Rd)?$/ =~ w
//   (format && street_1 == street_2) ? w.split(' at ')[1] : w
// end

// stops.each do |s|
//   desc = s['stop_name'].downcase.split(' ').map{|w| process_word(w)}.join(' ')
//   s['stop_desc'] = shorten_exact_address(desc)
// end

// File.write('NEW_stops.json', JSON.pretty_generate(stops))

export type SpotIconVariant =
  | 'museum'
  | 'gate'
  | 'academy'
  | 'buddha'
  | 'monastery'
  | 'mountain'
  | 'garden'
  | 'shrine'
  | 'relic'
  | 'canal'
  | 'tower'
  | 'pagoda'
  | 'wuhou'

export type SpotIconSpec = {
  label: string
  variant: SpotIconVariant
  accent: string
  glow: string
}

export const spotIconRegistry: Record<string, SpotIconSpec> = {
  河南博物院: { label: '博', variant: 'museum', accent: '#b36a2f', glow: '#f4d8b5' },
  少林寺: { label: '禅', variant: 'gate', accent: '#8d5628', glow: '#ead1b7' },
  嵩阳书院: { label: '书', variant: 'academy', accent: '#7b5b42', glow: '#e8d9c9' },
  龙门石窟: { label: '窟', variant: 'buddha', accent: '#5f646f', glow: '#d9dde3' },
  白马寺: { label: '寺', variant: 'monastery', accent: '#997748', glow: '#efe0c5' },
  老君山: { label: '山', variant: 'mountain', accent: '#3f7660', glow: '#d2ebe2' },
  清明上河园: { label: '园', variant: 'garden', accent: '#8a4d3a', glow: '#f3d8c9' },
  包公祠: { label: '祠', variant: 'shrine', accent: '#7c3c3c', glow: '#ecd2d2' },
  殷墟: { label: '墟', variant: 'relic', accent: '#6c5840', glow: '#e7dccb' },
  红旗渠: { label: '渠', variant: 'canal', accent: '#4e6f8b', glow: '#d7e4ef' },
  云台山: { label: '峰', variant: 'mountain', accent: '#46717d', glow: '#d7ecf2' },
  医圣祠: { label: '医', variant: 'shrine', accent: '#5d7c4c', glow: '#deedd4' },
  二七纪念塔: { label: '塔', variant: 'tower', accent: '#b7573c', glow: '#f2d3c9' },
  洛阳博物馆: { label: '馆', variant: 'museum', accent: '#8f6d39', glow: '#eadcb8' },
  铁塔公园: { label: '塔', variant: 'pagoda', accent: '#7e6032', glow: '#ebddc2' },
  卧龙岗武侯祠: { label: '侯', variant: 'wuhou', accent: '#566a8f', glow: '#d7deef' },
  西河古村: { label: '村', variant: 'gate', accent: '#8b6941', glow: '#eee0c7' },
}

'use client'

import { GuestHouseOption } from '../useGuestHouseOptions'

export const GuestHouseCheckBoxList = ({
  guestHouseOptions,
  onChange,
}: {
  guestHouseOptions: GuestHouseOption[]
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <>
      <div>民泊施設一覧</div>
      {guestHouseOptions &&
        guestHouseOptions.map((option) => {
          return (
            <div key={option.id}>
              <label>{option.name}</label>
              <input
                id={option.id.toString()}
                type='checkbox'
                name='guestHouses'
                checked={option.checked}
                onChange={onChange}
                value={option.id.toString()}
              />
            </div>
          )
        })}
    </>
  )
}

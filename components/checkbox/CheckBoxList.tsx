'use client'

export type Option = {
  id: number
  name: string
  checked: boolean
}

export const CheckBoxList = ({
  label,
  name,
  options,
  onChange,
}: {
  label: string
  name: string
  options: Option[]
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <div className='flex'>
      <div>{label}</div>
      <div className='flex w-100'>
        {options &&
          options.map((option) => {
            return (
              <div key={option.id} className='ml-4'>
                <input
                  id={option.id.toString()}
                  type='checkbox'
                  name={name}
                  checked={option.checked}
                  onChange={onChange}
                  value={option.id.toString()}
                />
                <label>{option.name}</label>
              </div>
            )
          })}
      </div>
    </div>
  )
}

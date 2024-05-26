import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export type CleaningStatusOption = {
  id: number
  name: string
  checked: boolean
}
export const useCleaningStatusOptions = (checkedValues: number[]) => {
  const [cleaningStatusOptions, setCleaningStatusOptions] = useState<
    CleaningStatusOption[]
  >([])

  useEffect(() => {
    const fetchGuestHouses = async () => {
      const supabase = createClient()

      const { data, error } = await supabase.from('cleaning_status').select('id, name')

      if (!error) {
        const options: CleaningStatusOption[] = data.map(({ id, name }) => ({
          id,
          name,
          checked: checkedValues.includes(id),
        }))
        setCleaningStatusOptions(options)
      }
    }

    void fetchGuestHouses()
  }, [])

  return { cleaningStatusOptions, setCleaningStatusOptions }
}

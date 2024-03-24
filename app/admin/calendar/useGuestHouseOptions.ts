import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export type GuestHouseOption = {
  id: number
  name: string
  checked: boolean
}

export const useGuestHouseOptions = () => {
  const [guestHouseOptions, setGuestHouseOptions] = useState<GuestHouseOption[]>([])

  useEffect(() => {
    const fetchGuestHouses = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('guest_houses')
        .select('id, name')
        .eq('owner_group_id', 1)

      if (!error) {
        const options: GuestHouseOption[] = data.map(({ id, name }) => ({
          id,
          name,
          checked: true,
        }))
        setGuestHouseOptions(options)
      }
    }

    void fetchGuestHouses()
  }, [])

  return { guestHouseOptions, setGuestHouseOptions }
}

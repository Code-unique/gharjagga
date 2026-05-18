'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProperties(params?: Record<string, string>) {
  const queryString = params 
    ? '?' + new URLSearchParams(params).toString()
    : ''
  
  const { data, error, isLoading, mutate } = useSWR(
    `/api/properties${queryString}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  )

  return {
    properties: data?.properties || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useProperty(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/properties/${id}` : null,
    fetcher
  )

  return {
    property: data,
    isLoading,
    isError: error,
  }
}
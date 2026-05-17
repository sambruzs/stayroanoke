import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './MapView.module.css'

function createPriceIcon(price) {
  const label = price > 0 ? `$${price}` : '—'
  return L.divIcon({
    className: '',
    html: `<div class="map-price-pin">${label}</div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
    popupAnchor: [0, -18],
  })
}

export default function MapView({ listings, searchParams }) {
  const center = [37.2710, -79.9414]
  const query = searchParams ? `?${searchParams}` : ''

  const pinnable = listings.filter(l => {
    const lat = l.address?.lat || l.geoTags?.coordinates?.[1]
    const lng = l.address?.lng || l.geoTags?.coordinates?.[0]
    return lat && lng
  })

  return (
    <div className={styles.wrap}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {pinnable.map(listing => {
          const lat = listing.address?.lat || listing.geoTags?.coordinates?.[1]
          const lng = listing.address?.lng || listing.geoTags?.coordinates?.[0]
          const price = listing.prices?.basePrice || listing.price?.basePrice || 0
          const photo = listing.pictures?.[0]?.thumbnail || listing.picture?.thumbnail

          return (
            <Marker
              key={listing._id || listing.id}
              position={[lat, lng]}
              icon={createPriceIcon(price)}
            >
              <Popup className={styles.popup}>
                {photo && <img src={photo} alt={listing.title} className={styles.popupImg} />}
                <div className={styles.popupBody}>
                  <p className={styles.popupTitle}>{listing.title}</p>
                  <p className={styles.popupMeta}>
                    {listing.bedrooms} bed · {listing.bathrooms} bath · up to {listing.accommodates}
                  </p>
                  {price > 0 && <p className={styles.popupPrice}><strong>${price}</strong> / night</p>}
                  <Link
                    to={`/listing/${listing._id || listing.id}${query}`}
                    className={styles.popupLink}
                  >
                    View property →
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      {pinnable.length === 0 && (
        <div className={styles.noCoords}>
          Map requires property coordinates — showing area map for Roanoke, VA
        </div>
      )}
    </div>
  )
}

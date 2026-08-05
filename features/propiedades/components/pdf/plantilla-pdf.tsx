import { Document, Page, Text, View, StyleSheet, Image, Link, Svg, Path } from '@react-pdf/renderer';

// Íconos SVG para que no se rompan
const IconLocation = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24">
    <Path
      fill="#FFFFFF"
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
    />
  </Svg>
);

const IconPhone = () => (
  <Svg width="11" height="11" viewBox="0 0 24 24">
    <Path
      fill="#F97316"
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
    />
  </Svg>
);

const IconCamera = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24">
    <Path
      fill="#FFFFFF"
      d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
    />
  </Svg>
);

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0F172A',
    padding: 0,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  coverHeader: {
    backgroundColor: '#0F172A',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  tagOperacion: {
    backgroundColor: '#EA580C',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  tituloPortada: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    marginBottom: 6,
    lineHeight: 1.2,
  },
  subtituloSuperficie: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38BDF8',
    marginBottom: 8,
  },
  precioText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F97316',
  },
  coverImageContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#1E293B',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#020617',
    paddingVertical: 12,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#EA580C',
  },
  footerBrand: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footerSub: {
    fontSize: 8,
    color: '#94A3B8',
  },
  footerPhone: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F97316',
  },
  innerPage: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    paddingBottom: 60,
    fontFamily: 'Helvetica',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    borderBottomWidth: 2,
    borderBottomColor: '#EA580C',
    paddingBottom: 4,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  descripcionText: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.5,
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
  },
  featureLabel: {
    fontSize: 8,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  featureValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  locationBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 15,
  },
  locationTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  btnMapLink: {
    backgroundColor: '#EA580C',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    textDecoration: 'none',
    textTransform: 'uppercase',
    marginTop: 4,
  }
});

interface PlantillaPdfProps {
  propiedad: any;
  contactLinks?: {
    telefono?: string;
    whatsapp?: string;
    email?: string;
  };
}

const getPdfImageUrl = (url: string) => {
  if (!url) return '';
  // Si la URL viene de tu proxy con query params, extraemos la URL original
  if (url.includes('url=')) {
    const original = new URLSearchParams(url.split('?')[1]).get('url');
    if (original) return original;
  }
  return url;
};

export function PlantillaPdf({ propiedad, contactLinks }: PlantillaPdfProps) {
  const telefonoContacto = contactLinks?.telefono || '11-3635-8302';
  const precioTexto = `${propiedad.moneda} $ ${propiedad.precio?.toLocaleString('es-AR')}`;
  const superficieTexto = propiedad.superficieTotal
    ? `${propiedad.superficieTotal} M²`
    : propiedad.superficieCubierta
    ? `${propiedad.superficieCubierta} M²`
    : '';

  const googleMapsUrl = propiedad.latitud && propiedad.longitud
    ? `https://www.google.com/maps/search/?api=1&query=${propiedad.latitud},${propiedad.longitud}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${propiedad.direccionPersonalizada || ''} ${propiedad.zona?.nombre || ''} Buenos Aires`
      )}`;

  const caracteristicasEntries = propiedad.caracteristicas
    ? Object.entries(propiedad.caracteristicas)
    : [];

  return (
    <Document title={`MS Propiedades - ${propiedad.codigo}`}>
      
      {/* PÁGINA 1: PORTADA */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHeader}>
          <Text style={styles.tagOperacion}>
            {propiedad.categoria === 'venta' ? 'EN VENTA' : 'EN ALQUILER'} • REF: {propiedad.codigo}
          </Text>
          <Text style={styles.tituloPortada}>{propiedad.titulo}</Text>
          
          {superficieTexto !== '' && (
            <Text style={styles.subtituloSuperficie}>{superficieTexto}</Text>
          )}

          <Text style={styles.precioText}>{precioTexto}</Text>
        </View>

        {propiedad.imagenes?.[0]?.url && (
          <View style={styles.coverImageContainer}>
            <Image src={getPdfImageUrl(propiedad.imagenes[0].url)} style={styles.fullImage} />
          </View>
        )}

        <View style={styles.footerBar}>
          <View>
            <Text style={styles.footerBrand}>MS PROPIEDADES INDUSTRIALES</Text>
            <Text style={styles.footerSub}>MATÍAS SETTECERZE • COL. 1219</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IconPhone />
            <Text style={styles.footerPhone}>{telefonoContacto}</Text>
          </View>
        </View>
      </Page>

      {/* PÁGINA 2: MEMORIA Y DATOS */}
      <Page size="A4" style={styles.innerPage}>
        <Text style={styles.sectionTitle}>MEMORIA DESCRIPTIVA</Text>
        <Text style={styles.descripcionText}>{propiedad.descripcion}</Text>

        {caracteristicasEntries.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>EQUIPAMIENTO Y CARACTERÍSTICAS</Text>
            <View style={styles.featuresGrid}>
              {caracteristicasEntries.map(([key, val]: [string, any]) => {
                if (!val) return null;
                const displayVal = typeof val === 'boolean' ? 'Sí' : String(val);
                return (
                  <View key={key} style={styles.featureItem}>
                    <Text style={styles.featureLabel}>{key}</Text>
                    <Text style={styles.featureValue}>{displayVal}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.locationBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <IconLocation />
            <Text style={styles.locationTitle}>UBICACIÓN Y ACCESOS</Text>
          </View>
          <Text style={{ fontSize: 10, color: '#94A3B8', marginBottom: 10, textAlign: 'center' }}>
            {propiedad.zona?.nombre ? `${propiedad.zona.nombre}` : 'Consulte ubicación exacta'}
          </Text>
          
          <Link src={googleMapsUrl} style={styles.btnMapLink}>
            TOCA AQUÍ PARA VER LA UBICACIÓN EN GOOGLE MAPS
          </Link>
        </View>

        <View style={styles.footerBar}>
          <View>
            <Text style={styles.footerBrand}>MS PROPIEDADES INDUSTRIALES</Text>
            <Text style={styles.footerSub}>MATÍAS SETTECERZE • COL. 1219</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IconPhone />
            <Text style={styles.footerPhone}>{telefonoContacto}</Text>
          </View>
        </View>
      </Page>

      {/* PÁGINAS SIGUIENTES: FOTOS */}
      {propiedad.imagenes?.slice(1, 5).map((img: any, idx: number) => (
        <Page key={img.id || idx} size="A4" style={styles.page}>
          <View style={{ padding: 20, paddingTop: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <IconCamera />
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF' }}>
                GALERÍA DE FOTOS ({idx + 2} / {propiedad.imagenes.length})
              </Text>
            </View>
            <View style={{ width: '100%', height: 680, borderRadius: 8, overflow: 'hidden' }}>
              <Image src={img.url} style={styles.fullImage} />
            </View>
          </View>

          <View style={styles.footerBar}>
            <View>
              <Text style={styles.footerBrand}>MS PROPIEDADES INDUSTRIALES</Text>
              <Text style={styles.footerSub}>REF: {propiedad.codigo}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconPhone />
              <Text style={styles.footerPhone}>{telefonoContacto}</Text>
            </View>
          </View>
        </Page>
      ))}

    </Document>
  );
}
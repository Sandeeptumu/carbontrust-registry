import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Store, SlidersHorizontal, ArrowUpRight, ShieldCheck } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { marketplaceCredits } from '../../api/credits'
import PurchaseModal from '../../components/credits/PurchaseModal'
import EcosystemGlyph, { EcosystemTile } from '../../components/EcosystemGlyph'
import { formatCurrency, formatNumber, formatDate } from '../../utils/format'

const ECOSYSTEMS = ['All ecosystems', 'MANGROVE', 'SEAGRASS', 'SALT MARSH']

function CreditCardView({ credit, index, onBuy }) {
  const sold = Number(credit.originalQuantity) - Number(credit.availableQuantity)
  const pct = credit.originalQuantity
    ? Math.min(100, (sold / Number(credit.originalQuantity)) * 100)
    : 0

  return (
    <motion.article
      className="card card--hover"
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      <div
        className="credit-card__visual"
        style={{
          background: `linear-gradient(135deg, ${credit.visualFrom || '#12593b'}, ${credit.visualTo || '#0f766e'})`,
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85 }}>
            Batch #{credit.ccbId}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, marginTop: 4, maxWidth: 220, lineHeight: 1.2 }}>
            {credit.projectName}
          </div>
          <div className="row" style={{ gap: 5, marginTop: 6, fontSize: 12, opacity: 0.9 }}>
            <MapPin size={12} /> {credit.location}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, alignSelf: 'flex-start' }}>
          <EcosystemTile ecosystem={credit.ecosystemType} light />
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div className="row row--between">
          <span className="badge badge--green">
            <ShieldCheck size={12} /> Verified credits
          </span>
          <span className="muted text-xs">{formatDate(credit.issuedDate)}</span>
        </div>

        <div className="row row--between">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--ink)' }}>
              {formatCurrency(credit.pricePerCredit)}
            </div>
            <div className="muted text-xs">per credit · 1 tCO₂e</div>
          </div>
          <div className="text-right">
            <div className="bold" style={{ fontSize: 15 }}>{formatNumber(credit.availableQuantity)}</div>
            <div className="muted text-xs">credits available</div>
          </div>
        </div>

        <div>
          <div className="row row--between text-xs mb-2">
            <span className="muted">{formatNumber(sold)} sold</span>
            <span className={pct > 90 ? 'bold' : 'muted'} style={pct > 90 ? { color: 'var(--warning)' } : undefined}>
              {formatNumber(credit.availableQuantity)} remaining
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--surface-sunken)', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: 'linear-gradient(90deg, var(--green-500), var(--teal-600))', transition: 'width .6s ease' }}
            />
          </div>
        </div>

        <div className="row" style={{ marginTop: 'auto' }}>
          <Button block icon={ArrowUpRight} onClick={() => onBuy(credit)}>
            View & buy
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

export default function MarketplacePage() {
  const [query, setQuery] = useState('')
  const [ecosystem, setEcosystem] = useState('All ecosystems')
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState(null)
  const { data, loading, error, run } = useAsync(useMemo(() => () => marketplaceCredits(), []))

  const credits = useMemo(() => {
    let list = data || []
    if (ecosystem !== 'All ecosystems') {
      list = list.filter((c) => (c.ecosystemType || '').toUpperCase() === ecosystem)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (c) =>
          (c.projectName || '').toLowerCase().includes(q) ||
          (c.location || '').toLowerCase().includes(q) ||
          (c.ownerUsername || '').toLowerCase().includes(q),
      )
    }
    const sorted = [...list]
    if (sort === 'newest') sorted.sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate))
    if (sort === 'price-low') sorted.sort((a, b) => a.pricePerCredit - b.pricePerCredit)
    if (sort === 'available') sorted.sort((a, b) => b.availableQuantity - a.availableQuantity)
    return sorted
  }, [data, ecosystem, query, sort])

  const totalAvailable = useMemo(
    () => (data || []).reduce((sum, c) => sum + Number(c.availableQuantity || 0), 0),
    [data],
  )

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Carbon marketplace"
        title="Verified blue carbon credits"
        subtitle="Every batch has been independently verified. Purchased credits are held in your portfolio and can be retired at any time."
        actions={
          data && data.length > 0 ? (
            <span className="badge badge--green" style={{ fontSize: 12.5, padding: '9px 14px' }}>
              <ShieldCheck size={14} /> {formatNumber(totalAvailable)} credits available
            </span>
          ) : null
        }
      />

      <div className="market-hero">
        <div>
          <h2>Restore the coast. Remove carbon. 🌊</h2>
          <p>
            Support mangrove, seagrass and salt-marsh restoration while securing high-integrity
            credits for your climate goals. New batches appear as projects are verified.
          </p>
        </div>
        <EcosystemTile ecosystem="MANGROVE" size="lg" light />
      </div>

      {loading ? (
        <SkeletonList rows={3} card />
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={run} />
        </Card>
      ) : (data || []).length === 0 ? (
        <Card>
          <EmptyState
            icon={Store}
            title="No credits on the market yet"
            description="Carbon credit batches appear here once an NGO project has been verified and credits are issued. Check back soon, or explore what's already in your portfolio."
          />
        </Card>
      ) : (
        <>
          <Card style={{ padding: '14px 18px', marginBottom: 20 }}>
            <div className="row row--wrap" style={{ gap: 14 }}>
              <div className="row" style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                <Search size={17} style={{ position: 'absolute', left: 12, color: 'var(--muted)' }} aria-hidden="true" />
                <input
                  className="input"
                  style={{ paddingLeft: 38 }}
                  placeholder="Search project, location or NGO…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search credits"
                />
              </div>
              <div className="row row--wrap" style={{ gap: 10 }} role="group" aria-label="Filter by ecosystem">
                <SlidersHorizontal size={16} className="muted" aria-hidden="true" />
                {ECOSYSTEMS.map((item) => {
                  const active = ecosystem === item
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`tab ${active ? 'is-active' : ''}`}
                      onClick={() => setEcosystem(item)}
                    >
                      <EcosystemGlyph ecosystem={item === 'All ecosystems' ? undefined : item} size={15} />
                      {item === 'All ecosystems' ? 'All' : item[0] + item.slice(1).toLowerCase()}
                    </button>
                  )
                })}
              </div>
              <select
                aria-label="Sort credits"
                className="select hide-mobile"
                style={{ width: 190, margin: 0 }}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="price-low">Lowest price</option>
                <option value="available">Most available</option>
              </select>
            </div>
          </Card>

          {credits.length === 0 ? (
            <Card>
              <EmptyState
                icon={Search}
                title="No matching batches"
                description="Try clearing your search or choosing another ecosystem filter."
              />
            </Card>
          ) : (
            <div className="grid grid--cards">
              {credits.map((credit, index) => (
                <CreditCardView key={credit.ccbId} credit={credit} index={index} onBuy={setSelected} />
              ))}
            </div>
          )}
        </>
      )}

      <PurchaseModal
        batch={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onPurchased={() => run()}
      />
    </PageTransition>
  )
}

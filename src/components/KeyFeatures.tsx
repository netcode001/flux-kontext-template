// 导入文案系统
import { home } from "@/lib/content"

interface Feature {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: "https://ext.same-assets.com/3508820607/3170004912.svg",
    title: home.features.items[0].title,
    description: home.features.items[0].description
  },
  {
    icon: "https://ext.same-assets.com/3508820607/3939565216.svg",
    title: home.features.items[1].title,
    description: home.features.items[1].description
  },
  {
    icon: "https://ext.same-assets.com/3508820607/2059979464.svg",
    title: home.features.items[2].title,
    description: home.features.items[2].description
  },
  {
    icon: "https://ext.same-assets.com/3508820607/403100032.svg",
    title: home.features.items[3].title,
    description: home.features.items[3].description
  },
  {
    icon: "https://ext.same-assets.com/3508820607/1573002659.svg",
    title: home.features.items[4].title,
    description: home.features.items[4].description
  },
  {
    icon: "https://ext.same-assets.com/3508820607/4162928580.svg",
    title: home.features.items[5].title,
    description: home.features.items[5].description
  }
]

export function KeyFeatures() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {home.features.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            {home.features.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={`feature-${feature.title.replace(/\s+/g, '-').toLowerCase()}`} className="group">
              <div className="bg-card border border-border rounded-lg p-6 h-full hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <img
                      src={feature.icon}
                      alt={`${feature.title} - LabubuHub Feature Icon`}
                      className="w-6 h-6 filter brightness-0 invert opacity-80"
                      style={{
                        filter: 'brightness(0) saturate(100%) invert(78%) sepia(15%) saturate(684%) hue-rotate(22deg) brightness(96%) contrast(89%)'
                      }}
                      loading="lazy"
                      width="24"
                      height="24"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

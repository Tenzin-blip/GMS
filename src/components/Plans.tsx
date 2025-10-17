import { Zap, Crown, Gem, Check, Dumbbell } from 'lucide-react'

export default function Plans() {
  const plans = [
    {
      name: 'Essential',
      icon: Zap,
      description: 'Perfect for beginners starting their fitness journey',
      price: 'NRP 3,000',
      period: '/month',
      features: [
        'Access to basic gym equipment',
        'Basic fitness assessment',
        'System access',
        'Locker room access',
      ],
      popular: false,
    },
    {
      name: 'Premium',
      icon: Crown,
      description: 'Most popular choice for serious fitness enthusiasts',
      price: 'NRP 4,500',
      period: '/month',
      features: [
        'Everything in Essential',
        'Nutrition consultation',
        'Guest passes (2/month)',
        'Recovery zone access',
        'Progress tracking',
      ],
      popular: true,
    },
    {
      name: 'Elite',
      icon: Gem,
      description: 'Ultimate experience for dedicated athletes',
      price: 'NRP 6,000',
      period: '/month',
      features: [
        'Everything in Premium',
        'VIP amenities',
        'Unlimited guest passes',
        'Recovery treatments',
        'Private training area',
      ],
      popular: false,
    },
  ]

  return (
    <div className="h-fit w-full pt-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-10 ">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const isMiddle = plan.popular

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl bg-neutral-700 transition-all duration-300 hover:shadow-xl ${
                  isMiddle
                    ? 'border-orange-500 shadow-2xl scale-105 z-10'
                    : 'border-slate-200 shadow-lg'
                } ${isMiddle ? 'w-100' : 'w-95'}`}
              >
                {isMiddle && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#f80a0a] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-5 md:p-8 flex flex-col items-center text-center">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
                  >
                    <Icon className={`w-7 h-7 ${isMiddle ? 'text-[#f80a0a]' : 'text-[#f80a0a]'}`} />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-200 text-sm mb-2 min-h-[20px]">{plan.description}</p>

                  <div className="mb-8">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-200">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Dumbbell className="w-4 h-4 text-[#f80a0a] mt-0.5" />

                        <span className="text-white text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-xl bebas text-xl transition-all duration-200 ${
                      isMiddle
                        ? 'bg-[#f80a0a] text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
                        : 'text-white border-2 border-[#f80a0a] hover:bg-orange-50 hover:text-[#f80a0a] hover:border-orange-300'
                    }`}
                  >
                    Choose Plan
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

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
    <div className="h-fit w-full pt-8 sm:pt-12 md:pt-16 ">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-6 md:gap-8 lg:gap-10">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const isMiddle = plan.popular

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl bg-neutral-700 transition-all duration-300 hover:shadow-xl w-full sm:max-w-sm lg:max-w-none ${
                  isMiddle
                    ? 'border-2 border-orange-500 shadow-2xl lg:scale-105 lg:z-10'
                    : 'border-2 border-slate-200 shadow-lg'
                } ${isMiddle ? 'lg:w-96' : 'lg:w-80'}`}
              >
                {isMiddle && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-[#f80a0a] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center text-center">
                  <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-xl mb-3 sm:mb-4">
                    <Icon className="w-6 sm:w-7 h-6 sm:h-7 text-[#f80a0a]" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-200 text-xs sm:text-sm mb-4 sm:mb-6 min-h-[40px] line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="mb-6 sm:mb-8">
                    <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-200 text-xs sm:text-sm ml-2">{plan.period}</span>
                  </div>

                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 w-full text-left">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3">
                        <Dumbbell className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#f80a0a] mt-0.5 flex-shrink-0" />
                        <span className="text-white text-xs sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-2.5 sm:py-3 rounded-xl bebas text-lg sm:text-xl transition-all duration-200 ${
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

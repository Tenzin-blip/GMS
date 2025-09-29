import { Zap, Crown, Gem, Check } from 'lucide-react'


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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-center gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const isMiddle = plan.popular

            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                  isMiddle
                    ? 'border-orange-500 shadow-2xl scale-105 z-10'
                    : 'border-gray-200 shadow-lg'
                } ${isMiddle ? 'w-96' : 'w-80'}`}
              >
                {isMiddle && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${
                      isMiddle ? 'bg-orange-100' : 'bg-orange-50'
                    }`}
                  >
                    <Icon
                      className={`w-7 h-7 ${isMiddle ? 'text-orange-600' : 'text-orange-500'}`}
                    />
                  </div>

                  {isMiddle && <Crown className="absolute top-6 right-6 w-8 h-8 text-orange-500" />}

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-6 min-h-[40px]">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-orange-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isMiddle
                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
                        : 'bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50'
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

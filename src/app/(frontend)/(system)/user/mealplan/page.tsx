'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { SectionFade } from '@/components/animations/SectionFade'
import { Flame } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const weekDays = [
  { key: 'sunday', label: 'Sun', dateLabel: '15', focus: 'Upper' },
  { key: 'monday', label: 'Mon', dateLabel: '16', focus: 'Lower' },
  { key: 'tuesday', label: 'Tue', dateLabel: '17', focus: 'Active' },
  { key: 'wednesday', label: 'Wed', dateLabel: '18', focus: 'Chest' },
  { key: 'thursday', label: 'Thu', dateLabel: '11', focus: 'Leg' },
  { key: 'friday', label: 'Fri', dateLabel: '12', focus: 'Core' },
  { key: 'saturday', label: 'Sat', dateLabel: '13', focus: 'Rest' },
]

const dayMeals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner']

const weekPlan = {
  sunday: [
    {
      name: 'Greek Yogurt Bowl',
      calories: 500,
      protein: 28,
      carbs: 55,
      fats: 12,
      slot: 'Breakfast',
      description: 'Greek yogurt with granola and fresh berries',
    },
    {
      name: 'Grilled Chicken Rice Bowl',
      calories: 700,
      protein: 40,
      carbs: 70,
      fats: 20,
      slot: 'Lunch',
      description: 'Grilled chicken breast with brown rice and mixed vegetables',
    },
    {
      name: 'Mixed Nuts + Banana',
      calories: 350,
      protein: 6,
      carbs: 28,
      fats: 22,
      slot: 'Snacks',
      description: 'Handful of mixed nuts with a medium banana',
    },
    {
      name: 'Salmon + Veggies',
      calories: 600,
      protein: 33,
      carbs: 25,
      fats: 32,
      slot: 'Dinner',
      description: 'Baked salmon with roasted seasonal vegetables',
    },
  ],
  monday: [
    {
      name: 'Oats with Peanut Butter',
      calories: 520,
      protein: 22,
      carbs: 60,
      fats: 18,
      slot: 'Breakfast',
      description: 'Steel-cut oats with peanut butter and banana',
    },
    {
      name: 'Turkey Wrap + Salad',
      calories: 680,
      protein: 35,
      carbs: 58,
      fats: 22,
      slot: 'Lunch',
      description: 'Whole wheat wrap with turkey and garden salad',
    },
    {
      name: 'Protein Bar',
      calories: 300,
      protein: 20,
      carbs: 25,
      fats: 9,
      slot: 'Snacks',
      description: 'High-protein energy bar',
    },
    {
      name: 'Stir-Fried Tofu + Rice',
      calories: 580,
      protein: 28,
      carbs: 65,
      fats: 14,
      slot: 'Dinner',
      description: 'Tofu stir-fry with jasmine rice',
    },
  ],
  tuesday: [
    {
      name: 'Smoothie Bowl',
      calories: 450,
      protein: 20,
      carbs: 65,
      fats: 10,
      slot: 'Breakfast',
      description: 'Acai smoothie bowl with granola and fruits',
    },
    {
      name: 'Beef Stir Fry',
      calories: 720,
      protein: 40,
      carbs: 55,
      fats: 32,
      slot: 'Lunch',
      description: 'Lean beef with mixed vegetables and noodles',
    },
    {
      name: 'Apple + Peanut Butter',
      calories: 310,
      protein: 7,
      carbs: 30,
      fats: 18,
      slot: 'Snacks',
      description: 'Fresh apple slices with natural peanut butter',
    },
    {
      name: 'Chicken Pasta',
      calories: 650,
      protein: 35,
      carbs: 70,
      fats: 15,
      slot: 'Dinner',
      description: 'Whole grain pasta with grilled chicken',
    },
  ],
  wednesday: [
    {
      name: 'Scrambled Eggs + Toast',
      calories: 480,
      protein: 25,
      carbs: 40,
      fats: 20,
      slot: 'Breakfast',
      description: 'Scrambled eggs with whole grain toast',
    },
    {
      name: 'Chicken Buddha Bowl',
      calories: 690,
      protein: 38,
      carbs: 65,
      fats: 24,
      slot: 'Lunch',
      description: 'Chicken with quinoa, avocado, and veggies',
    },
    {
      name: 'Yogurt Cup',
      calories: 200,
      protein: 12,
      carbs: 22,
      fats: 6,
      slot: 'Snacks',
      description: 'Greek yogurt with honey',
    },
    {
      name: 'Tuna Rice Bowl',
      calories: 600,
      protein: 32,
      carbs: 50,
      fats: 18,
      slot: 'Dinner',
      description: 'Tuna with brown rice and edamame',
    },
  ],
  thursday: [
    {
      name: 'Chia Pudding + Fruits',
      calories: 430,
      protein: 18,
      carbs: 45,
      fats: 14,
      slot: 'Breakfast',
      description: 'Chia seed pudding with mixed berries',
    },
    {
      name: 'Paneer Rice Bowl',
      calories: 700,
      protein: 32,
      carbs: 65,
      fats: 26,
      slot: 'Lunch',
      description: 'Paneer tikka with basmati rice',
    },
    {
      name: 'Mixed Nuts',
      calories: 280,
      protein: 5,
      carbs: 10,
      fats: 23,
      slot: 'Snacks',
      description: 'Assorted roasted nuts',
    },
    {
      name: 'Chicken Soup + Toast',
      calories: 540,
      protein: 28,
      carbs: 45,
      fats: 12,
      slot: 'Dinner',
      description: 'Hearty chicken soup with whole grain toast',
    },
  ],
  friday: [
    {
      name: 'Avocado Toast + Egg',
      calories: 520,
      protein: 22,
      carbs: 42,
      fats: 26,
      slot: 'Breakfast',
      description: 'Mashed avocado on toast with poached egg',
    },
    {
      name: 'Beef Burrito Bowl',
      calories: 730,
      protein: 42,
      carbs: 70,
      fats: 25,
      slot: 'Lunch',
      description: 'Beef with rice, beans, and fresh toppings',
    },
    {
      name: 'Granola Bar',
      calories: 250,
      protein: 8,
      carbs: 35,
      fats: 8,
      slot: 'Snacks',
      description: 'Homemade granola energy bar',
    },
    {
      name: 'Veg Pasta + Tofu',
      calories: 620,
      protein: 30,
      carbs: 75,
      fats: 14,
      slot: 'Dinner',
      description: 'Vegetable pasta with crispy tofu',
    },
  ],
  saturday: [
    {
      name: 'Greek Yogurt Bowl',
      calories: 500,
      protein: 28,
      carbs: 55,
      fats: 12,
      slot: 'Breakfast',
      description: 'Greek yogurt with granola and fresh berries',
    },
    {
      name: 'Grilled Chicken Rice Bowl',
      calories: 700,
      protein: 40,
      carbs: 70,
      fats: 20,
      slot: 'Lunch',
      description: 'Grilled chicken breast with brown rice and mixed vegetables',
    },
    {
      name: 'Mixed Nuts + Banana',
      calories: 350,
      protein: 6,
      carbs: 28,
      fats: 22,
      slot: 'Snacks',
      description: 'Handful of mixed nuts with a medium banana',
    },
    {
      name: 'Salmon + Veggies',
      calories: 600,
      protein: 33,
      carbs: 25,
      fats: 32,
      slot: 'Dinner',
      description: 'Baked salmon with roasted seasonal vegetables',
    },
  ],
}

export default function MealPlan() {
  const searchParams = useSearchParams()
  const planTier = (searchParams.get('plan') as 'essential' | 'premium' | 'elite') || 'premium'
  const [activeDayKey, setActiveDayKey] = useState<string>('wednesday')

  const rotatedDays = useMemo(() => {
    const todayIndex = new Date().getDay()
    return [...weekDays.slice(todayIndex), ...weekDays.slice(0, todayIndex)]
  }, [])

  useEffect(() => {
    setActiveDayKey(rotatedDays[0]?.key || 'wednesday')
  }, [rotatedDays])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 left-8 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-12 right-10 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl" />
      </div>

      <SectionFade className="max-w-6xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-400 uppercase tracking-wide">Meal Plan</p>
            <h1 className="text-4xl font-bold">Your personalised weekly nutrition schedule</h1>
            <p className="text-sm text-gray-300 mt-1">
              Starting from today • tap any day to switch
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-200">
              {new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(new Date())}
            </span>
          </div>
        </div>

        {planTier === 'essential' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-200 backdrop-blur-xl">
            You are on the Essential plan. Upgrade to unlock trainer-personalized meals. Meanwhile,
            here’s your generic plan.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 w-full h-28">
          {rotatedDays.map((day) => (
            <button
              key={day.key}
              onClick={() => setActiveDayKey(day.key)}
              className={`w-full px-4 py-3 rounded-2xl border text-left ${
                activeDayKey === day.key
                  ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/30'
                  : 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10'
              }`}
            >
              <p className="text-xs opacity-80">{day.label}</p>
              <p className="text-lg font-semibold">{day.dateLabel}</p>
              <p className="text-xs opacity-80">{day.focus}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rotatedDays.map((d) => {
            const meals = weekPlan[d.key as keyof typeof weekPlan]
            return (
              <div
                key={d.key}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                  <div>
                    <p className="text-xs text-gray-300">{d.label}</p>
                  </div>
                  <span className="text-xs px-3 py-2 rounded-full bg-white/10 border border-white/10">
                    2400 cal
                  </span>
                </div>

                <div className="divide-y divide-white/10">
                  {meals.map((meal, idx) => (
                    <div key={`${meal.slot}-${idx}`} className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-semibold text-sm">{meal.name}</p>
                          <p className="text-xs text-gray-400">
                            {meal.calories} cal • P: {meal.protein}g • C: {meal.carbs}g • F:{' '}
                            {meal.fats}g
                          </p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-orange-500/10 border border-orange-400/30 text-orange-100">
                          {meal.slot}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{meal.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </SectionFade>
    </div>
  )
}

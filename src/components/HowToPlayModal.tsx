import { X } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-amber-950/95 to-purple-950/95 rounded-lg border-4 border-amber-600/40 shadow-2xl overflow-hidden">
        <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-b-2 border-amber-600/40">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            BANNERFALL: QUICK START GUIDE
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-amber-800/40 transition-all"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-amber-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-6 text-amber-200">
          <section className="mb-8">
            <h3 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span className="text-orange-500">1.</span> THE SETUP
            </h3>
            <ul className="space-y-2 ml-6">
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">Deployment:</span> Arrange your 16 Characters + 2 plateaus in a secret arrangement hidden from your opponent.
                  <ul className="mt-1 ml-4 space-y-1">
                    <li className="text-amber-200/80">Player 1 places units on the top 4 rows of the board</li>
                    <li className="text-amber-200/80">Player 2 places units on the bottom 4 rows of the board</li>
                    <li className="text-amber-200/80">The middle row is No Man's Land and must remain empty</li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">The Reveal:</span> The Barrier is removed. The player with the most mages in their front row goes first.
                </div>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span className="text-orange-500">2.</span> YOUR TURN (2 ACTIONS + 1 CAST)
            </h3>
            <p className="mb-3 text-amber-300">Spend your 2 Actions on any combination of the following:</p>
            <ul className="space-y-3 ml-6">
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">MOVE:</span> in any direction (costs 1 action)
                  <ul className="mt-1 ml-4">
                    <li className="text-amber-200/80">Climbing a Plateau: Costs 2 Actions to enter, 1 Action to exit.</li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">ATTACK:</span> Deal damage based on your unit's ATK value (costs 1 action).
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">CYCLE:</span> draw 3 new cards (costs 1 action). This is the only way to get cards.
                </div>
              </li>
            </ul>
            <p className="mt-4 mb-3 text-amber-300">Additionally, each Mage can cast once per turn:</p>
            <ul className="space-y-3 ml-6">
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">CAST:</span> Play a Buff or Nerf card from your Mage to another unit, within the Mage's range (in any direction). Does not consume an action, but each Mage can only cast once per turn.
                </div>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span className="text-orange-500">3.</span> OTHER RULES
            </h3>
            <ul className="space-y-2 ml-6">
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">One Attack per unit per turn:</span> Each unit can only attack once per turn, but can use its 2 actions for other activities (move, cycle cards, etc).
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">One Cast per Mage per turn:</span> Each Mage can cast only one card per turn. Casting does not consume actions.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">Swap:</span> Swapping unit positions counts as one action.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">Card effect duration:</span> Most card effects last until the next turn or until the triggered action has been performed.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">Skipping:</span> A player can skip turn if they chose, but not two consecutively.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">6 Cards:</span> Maximum 6 cards in hand at any time.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">Unit movement after a kill:</span> Brutes, Warlords, and Assassins move into hex of unit killed. Archers stay in their current Hex.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <div>
                  <span className="font-semibold text-amber-300">Health tracking:</span> Keep an eye on many Health Points your unit has remaining.
                </div>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span className="text-orange-500">4.</span> THE UNITS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-amber-900/40">
                    <th className="border border-amber-600/30 p-3 text-left text-amber-300 font-semibold">Unit</th>
                    <th className="border border-amber-600/30 p-3 text-center text-amber-300 font-semibold">HP</th>
                    <th className="border border-amber-600/30 p-3 text-center text-amber-300 font-semibold">ATK</th>
                    <th className="border border-amber-600/30 p-3 text-center text-amber-300 font-semibold">RANGE</th>
                    <th className="border border-amber-600/30 p-3 text-center text-amber-300 font-semibold">Movement</th>
                    <th className="border border-amber-600/30 p-3 text-left text-amber-300 font-semibold">Special Ability</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-amber-900/20">
                    <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Warlord</td>
                    <td className="border border-amber-600/30 p-3 text-center">14</td>
                    <td className="border border-amber-600/30 p-3 text-center">5</td>
                    <td className="border border-amber-600/30 p-3 text-center">1</td>
                    <td className="border border-amber-600/30 p-3 text-center">2</td>
                    <td className="border border-amber-600/30 p-3 text-sm">Can use special Warlord Buff cards</td>
                  </tr>
                  <tr className="hover:bg-amber-900/20">
                    <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Brute</td>
                    <td className="border border-amber-600/30 p-3 text-center">7</td>
                    <td className="border border-amber-600/30 p-3 text-center">3</td>
                    <td className="border border-amber-600/30 p-3 text-center">1</td>
                    <td className="border border-amber-600/30 p-3 text-center">1</td>
                    <td className="border border-amber-600/30 p-3 text-sm">-</td>
                  </tr>
                  <tr className="hover:bg-amber-900/20">
                    <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Archer</td>
                    <td className="border border-amber-600/30 p-3 text-center">4</td>
                    <td className="border border-amber-600/30 p-3 text-center">2</td>
                    <td className="border border-amber-600/30 p-3 text-center">1-2</td>
                    <td className="border border-amber-600/30 p-3 text-center">1</td>
                    <td className="border border-amber-600/30 p-3 text-sm">Can shoot over any friendly or opposition unit.</td>
                  </tr>
                  <tr className="hover:bg-amber-900/20">
                    <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Mage</td>
                    <td className="border border-amber-600/30 p-3 text-center">4</td>
                    <td className="border border-amber-600/30 p-3 text-center">0</td>
                    <td className="border border-amber-600/30 p-3 text-center">3</td>
                    <td className="border border-amber-600/30 p-3 text-center">1</td>
                    <td className="border border-amber-600/30 p-3 text-sm">Only unit that can Cast Nerfs and Buffs.</td>
                  </tr>
                  <tr className="hover:bg-amber-900/20">
                    <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Assassin</td>
                    <td className="border border-amber-600/30 p-3 text-center">2</td>
                    <td className="border border-amber-600/30 p-3 text-center">1</td>
                    <td className="border border-amber-600/30 p-3 text-center">1-4</td>
                    <td className="border border-amber-600/30 p-3 text-center">4</td>
                    <td className="border border-amber-600/30 p-3 text-sm">Deals +3 damage (4 total) when adjacent to an opposing unit. Can attack targets within 4 tiles if any clear path exists.</td>
                  </tr>
                  <tr className="hover:bg-amber-900/20">
                    <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Plateaus</td>
                    <td className="border border-amber-600/30 p-3 text-center">-</td>
                    <td className="border border-amber-600/30 p-3 text-center">-</td>
                    <td className="border border-amber-600/30 p-3 text-center">-</td>
                    <td className="border border-amber-600/30 p-3 text-center">-</td>
                    <td className="border border-amber-600/30 p-3 text-sm">Gives Mages +1 range. Archers on plateaus deal +1 damage and take -1 damage. Takes 2 actions to climb, 1 action to descend.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-6">
            <h3 className="text-2xl font-bold text-amber-400 mb-4">VICTORY CONDITION</h3>
            <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border-2 border-orange-500/40 rounded-lg p-4">
              <p className="text-amber-200 font-semibold text-lg">
                <span className="text-orange-400">BANNERFALL:</span> End your turn with any unit on the enemy's Banner.
              </p>
            </div>
          </section>

          <section className="mb-6">
            <h3 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span className="text-orange-500">5.</span> CARD REFERENCE
            </h3>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-green-400 mb-3">BUFF CARDS</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-900/40">
                      <th className="border border-amber-600/30 p-3 text-left text-amber-300 font-semibold">Card Name</th>
                      <th className="border border-amber-600/30 p-3 text-left text-amber-300 font-semibold">Effect</th>
                      <th className="border border-amber-600/30 p-3 text-center text-amber-300 font-semibold">Rarity</th>
                      <th className="border border-amber-600/30 p-3 text-center text-amber-300 font-semibold">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Transfusion</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Heal target unit plus 2 HP</td>
                      <td className="border border-amber-600/30 p-3 text-center text-gray-300">Common</td>
                      <td className="border border-amber-600/30 p-3 text-center">8</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Phantasmic Shield</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Target unit takes 2 less damage next turn</td>
                      <td className="border border-amber-600/30 p-3 text-center text-gray-300">Common</td>
                      <td className="border border-amber-600/30 p-3 text-center">5</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Axehound</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Target Brute deals +1 Damage on its next attack</td>
                      <td className="border border-amber-600/30 p-3 text-center text-gray-300">Common</td>
                      <td className="border border-amber-600/30 p-3 text-center">4</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Poison Arrow</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Target Archer deals +1 Damage on its next attack</td>
                      <td className="border border-amber-600/30 p-3 text-center text-gray-300">Common</td>
                      <td className="border border-amber-600/30 p-3 text-center">4</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Shadow's Edge</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Target Assassin deals +1 Damage on its next attack</td>
                      <td className="border border-amber-600/30 p-3 text-center text-gray-300">Common</td>
                      <td className="border border-amber-600/30 p-3 text-center">4</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">King of the Hill</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Archer on a Plateau deals +2 Damage on its next attack</td>
                      <td className="border border-amber-600/30 p-3 text-center text-blue-400">Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">2</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Farsight</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Archer gains +1 Range for this turn</td>
                      <td className="border border-amber-600/30 p-3 text-center text-blue-400">Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">2</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Swift Foot</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Target unit gains +1 Movement for this turn</td>
                      <td className="border border-amber-600/30 p-3 text-center text-blue-400">Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">3</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Spectral Shift</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Selected mage can move up to 5 hexes next turn</td>
                      <td className="border border-amber-600/30 p-3 text-center text-blue-400">Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">2</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">In & Out Murder</td>
                      <td className="border border-amber-600/30 p-3 text-sm">If target Assassin attack results in a kill this turn, they gain +1 Movement for this turn</td>
                      <td className="border border-amber-600/30 p-3 text-center text-blue-400">Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">2</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Martyr Protocol</td>
                      <td className="border border-amber-600/30 p-3 text-sm">All units within 2 hexes of your Banner gain +2 Atk next turn. Casting Mage loses 1HP</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Shroud of Turino</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Assassin is invisible to enemies for one turn (cannot be attacked or nerfed)</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Raging Pulse</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Brute receives +3 damage on next attack</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Echo Strike</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Selected brute gains one extra attack this turn</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Spinal Ripcord</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Warlord deals +2 Damage. Attack ignores all enemy Shields or Damage-reduction buffs</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Soul Siphon</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Warlord deals +2 Damage. If the target dies, your Warlord heals 1 HP</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Rampage</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Warlord gains one extra attack action this turn (must be used in same turn)</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Super Smash</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Warlord does +1 damage to all enemy units within two tiles of the attacked unit</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-red-400 mb-3">NERF CARDS</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-red-900/40">
                      <th className="border border-amber-600/30 p-3 text-left text-amber-300 font-semibold">Card Name</th>
                      <th className="border border-amber-600/30 p-3 text-left text-amber-300 font-semibold">Effect</th>
                      <th className="border border-amber-600/30 p-3 text-center text-amber-300 font-semibold">Rarity</th>
                      <th className="border border-amber-600/30 p-3 text-center text-amber-300 font-semibold">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Overwound Strings</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Target Archer deals -1 Damage on its next attack</td>
                      <td className="border border-amber-600/30 p-3 text-center text-gray-300">Common</td>
                      <td className="border border-amber-600/30 p-3 text-center">7</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Toe Rot</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Target enemy cannot perform a Move action on their next turn</td>
                      <td className="border border-amber-600/30 p-3 text-center text-gray-300">Common</td>
                      <td className="border border-amber-600/30 p-3 text-center">8</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Blinding Dust</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Target enemy's Range is reduced by 1 for their next turn</td>
                      <td className="border border-amber-600/30 p-3 text-center text-gray-300">Common</td>
                      <td className="border border-amber-600/30 p-3 text-center">4</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Brittle blade</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Target Brute deals -2 Damage on its next attack</td>
                      <td className="border border-amber-600/30 p-3 text-center text-gray-300">Common</td>
                      <td className="border border-amber-600/30 p-3 text-center">4</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Coward's Mark</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Target opponent unit cannot make an attack on their next turn</td>
                      <td className="border border-amber-600/30 p-3 text-center text-blue-400">Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">2</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Grave Debt</td>
                      <td className="border border-amber-600/30 p-3 text-sm">When target unit dies, the nearest enemy Mage loses 2 HP</td>
                      <td className="border border-amber-600/30 p-3 text-center text-blue-400">Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">2</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Claws of crabs</td>
                      <td className="border border-amber-600/30 p-3 text-sm">If targeted enemy unit has two of your units adjacent to it, +1 attack for each adjacent friendly unit</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">4</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Weight of Command</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Enemy Warlord loses 1 Atk for every ally currently adjacent to him</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Traitor's Toll</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Force an enemy unit to deal 2 Damage to their own adjacent Warlord</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                    <tr className="hover:bg-amber-900/20">
                      <td className="border border-amber-600/30 p-3 font-semibold text-amber-300">Shatter Terra</td>
                      <td className="border border-amber-600/30 p-3 text-sm">Selected mage can destroy an enemy plateau and kill any player on it</td>
                      <td className="border border-amber-600/30 p-3 text-center text-purple-400">Super Rare</td>
                      <td className="border border-amber-600/30 p-3 text-center">1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

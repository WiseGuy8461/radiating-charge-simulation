# Radiating Charge Simulation

An interactive HTML/JavaScript simulation of the electromagnetic field produced by a moving electric charge.

**[▶ Run the simulation](https://wiseguy8461.github.io/radiating-charge-simulation/)**

## Features

- **Multiple charge trajectories:** Explore sinusoidal, stationary, constant-acceleration, circular, and linear motion.
- **Electric field lines:** Visualize the spatial structure of the electric field.
- **Electric field vectors:** Toggle a vector-field representation to explore the field's direction and relative magnitude.
- **Wavefront visualization:** Display propagating wavefronts associated with the charge's electromagnetic field.
- **Animation controls:** Pause and resume the simulation to inspect its behavior.

## Physics and Relativity

An electric charge produces an electric field, but when the charge moves, its electromagnetic field changes with time. Because electromagnetic influences propagate at the speed of light rather than instantaneously, the field at a given location reflects the charge's earlier motion.

This simulation uses the Liénard–Wiechert potentials, which describe the electromagnetic potentials of a moving point charge while accounting for this finite propagation speed. The resulting field depends on the charge's position, velocity, and acceleration at the appropriate retarded time—the earlier time at which the charge's influence originated.

When a charge accelerates, changes in its electromagnetic field propagate outward as electromagnetic radiation. At relativistic speeds, the effects of special relativity become particularly important: the field becomes strongly direction-dependent, concentrating into different angular patterns depending on the charge's motion and acceleration.

The simulation provides several ways to explore these effects. Field lines show the spatial structure of the electric field, vectors represent its direction and relative magnitude, and wavefronts illustrate the propagation of changes in the field. By switching between different charge trajectories, users can investigate how motion affects the resulting visualization.

## How to Use

1. Open the [live simulation](https://wiseguy8461.github.io/radiating-charge-simulation/).
2. Select a charge trajectory from the dropdown menu.
3. Toggle **Show Field Lines**, **Show Vector Field**, and **Show Waves** to explore different representations of the field.
4. Pause or resume the animation to examine the visualization.

## Implementation

The simulation is built with HTML and JavaScript, using an HTML Canvas to render the animation.

- `index.html` defines the page layout and interactive controls.
- `sketch.js` implements the simulation and its visualizations.

## Background and Attribution

This project was inspired by PhET Interactive Simulations' [Radiating Charge](https://phet.colorado.edu/en/simulations/radiating-charge). I used the original simulation as a reference for the field lines and some particle trajectories, then implemented my own browser-based version and added trajectory variations, wavefront visualization, and electric-field vectors.

The electromagnetic theory is based on the [Liénard–Wiechert potentials](https://phys.libretexts.org/Bookshelves/Electricity_and_Magnetism/Essential_Graduate_Physics_-_Classical_Electrodynamics_(Likharev)/10%3A_Radiation_by_Relativistic_Charges/10.01%3A_Lienard-Wiechert_Potentials).

## Purpose

I built this simulation to make electromagnetic radiation easier to explore visually. By connecting mathematical descriptions of electromagnetic fields with interactive visualizations, I aim to make abstract physics concepts more intuitive for students.

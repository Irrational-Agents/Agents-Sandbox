using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    public float moveSpeed;
    public Rigidbody2D rb;
    private Vector2 moveDirection;

    // Reference to the Animator component
    private Animator animator;

    void Start() {
        animator = GetComponent<Animator>();
    }

    void Update() {
        ProcessInputs();
        UpdateAnimation();
    }

    void FixedUpdate() {
        Move();
    }

    void ProcessInputs() {
        float moveX = Input.GetAxisRaw("Horizontal");
        float moveY = Input.GetAxisRaw("Vertical");

        // Restrict movement to one direction at a time
        if (moveX != 0) {
            moveY = 0; // Disable vertical movement if moving horizontally
        }

        moveDirection = new Vector2(moveX, moveY).normalized;
    }

    void Move() {
        rb.velocity = new Vector2(moveDirection.x * moveSpeed, moveDirection.y * moveSpeed);
    }

    void UpdateAnimation() {
        // Check if player is moving
        if (moveDirection != Vector2.zero) {
            if (moveDirection.x > 0) {
                animator.Play("Player_Right");
                GetComponent<SpriteRenderer>().flipX = false; // Face right
            } else if (moveDirection.x < 0) {
                animator.Play("Player_Right");
                GetComponent<SpriteRenderer>().flipX = true; // Face left
            } else if (moveDirection.y > 0) {
                animator.Play("Player_Up");
            } else if (moveDirection.y < 0) {
                animator.Play("Player_Down");
            }
        } else {
            // If the player is not moving, play the idle animation
            animator.Play("Player_idle");
        }
    }
}

